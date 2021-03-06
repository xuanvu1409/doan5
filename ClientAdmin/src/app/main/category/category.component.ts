import {Component, Injector, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ScriptService} from 'src/app/libs/script.service';
import {CategoryService} from "../../services/category.service";
import {LazyLoadEvent, PrimeNGConfig, MessageService} from "primeng/api";

declare var $: any;

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css'],
  providers: [MessageService]
})
export class CategoryComponent extends ScriptService implements OnInit {
  list = [];
  totalRecords: number;
  loading: boolean;
  form: FormGroup;
  first = 0;
  rows = 10;
  aoe: boolean;
  submitted: boolean;

  constructor(
    injector: Injector,
    private categorySevice: CategoryService,
    private primeConfig: PrimeNGConfig,
    private messageService: MessageService,
    private formBuider: FormBuilder
  ) {
    super(injector);
  }

  ngOnInit(): void {

    this.loading = true;
    this.primeConfig.ripple = true;

    //Load script
    let elem = document.getElementsByClassName('script');
    if (elem.length != undefined) {
      for (var i = elem.length - 1; 0 <= i; i--) {
        elem[i].remove();
      }
    }
    this.loadScripts();

    //Validation
    this.form = this.formBuider.group({
      id: [''],
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(250)]],
      slug: ['', Validators.maxLength(250)],
      sortOrder: ['', [Validators.pattern('[0-9]+')]]
    })

    //Load data
    this.loadData({first: this.first, rows: this.rows})
  }

  loadData(event: LazyLoadEvent) {
    this.loading = true;
    this.first = event.first;
    this.rows = event.rows;
    setTimeout(() => {
      this.categorySevice.getPage(this.first, this.rows).subscribe((res: any) => {
        this.list = res.list;
        this.totalRecords = res.total;
        this.loading = false;
      })
    }, 1000);
  }

  showModal() {
    $("#largeModal").modal("show");
    this.form.reset();
  }

  create() {
    this.showModal();
    this.aoe = true;
  }

  edit(id) {
    this.showModal();
    this.aoe = false;
    this.categorySevice.edit(id).subscribe((data: any) => {
      this.form.patchValue({
        id: data.id,
        name: data.name,
        slug: data.slug,
        sortOrder: data.sortOrder
      });
    }, err => {
      console.log(err);
      this.messageService.add({severity: 'error', summary: 'Th???t b???i!', detail: err.error});
    });
  }

  onSubmit() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }
    if (this.aoe == true) {
      let category = {
        name: this.form.value.name,
        slug: this.slug(this.form.value.slug) ?? this.slug(this.form.value.name),
        sortOrder: this.form.value.sortOrder
      }
      this.categorySevice.create(category).subscribe((res: any) => {
        this.submitted = false;
        $("#largeModal").modal("hide");
        this.loadData({first: this.first, rows: this.rows});
        this.messageService.add({severity: 'success', summary: "Th??nh c??ng", detail: res.message});
      }, err => {
        console.log(err);
        this.messageService.add({severity: "error", summary: "Th???t b???i", detail: err.error});
      });
    } else {
      this.form.value.slug = this.form.value.slug.length > 0 ? this.slug(this.form.value.slug) : this.slug(this.form.value.name);
      this.categorySevice.update(this.form.value.id, this.form.value).subscribe((res: any) => {
        this.submitted = false;
        $("#largeModal").modal("hide");
        this.loadData({first: this.first, rows: this.rows});
        this.messageService.add({
          severity: "success",
          summary: "Th??nh c??ng",
          detail: res.message
        });
      }, err => {
        console.log(this.form.value)
        console.log(err);
        this.messageService.add({severity: "error", summary: "Th???t b???i", detail: err.error});
      });
    }
  }


  delete(id) {
    if (confirm("B???n mu???n x??a danh m???c n??y?")) {
      this.categorySevice.delete(id).subscribe((res: any) => {
        this.messageService.add({severity: 'success', summary: "Th??nh c??ng", detail: res.message});
        this.loadData({first: this.first, rows: this.rows});
      }, err => {
        console.log(err);
        this.messageService.add({severity: 'error', summary: "Th???t b???i", detail: err.error});
      })
    }
  }

  handleChange(event, id) {
    if (event.checked == false) {
      if (confirm("B???n mu???n ???n danh m???c n??y?")) {
        this.categorySevice.hide(id).subscribe((res: any) => {
          this.messageService.add({severity: 'success', summary: "Th??nh c??ng", detail: res.message});
        }, err => {
          console.log(err);
          this.messageService.add({severity: 'error', summary: "Th???t b???i", detail: err.error});
        })
      } else {
        this.loadData({first: this.first, rows: this.rows});
      }
    } else {
      if (confirm("B???n mu???n ???n danh m???c n??y?")) {
        this.categorySevice.show(id).subscribe((res: any) => {
          this.messageService.add({severity: 'success', summary: "Th??nh c??ng", detail: res.message});
        }, err => {
          console.log(err);
          this.messageService.add({severity: 'error', summary: "Th???t b???i", detail: err.error});
        })
      } else {
        this.loadData({first: this.first, rows: this.rows});
      }
    }
  }


  slug(name: string) {
    if (name == null) {
      return;
    }

    name.toLowerCase();

    name = name.replace(/\s+/g, "-");

    name = name.replace(/??|??|???|???|??|??|???|???|???|???|???|??|???|???|???|???|???/gi, 'a');
    name = name.replace(/??|??|???|???|???|??|???|???|???|???|???/gi, 'e');
    name = name.replace(/i|??|??|???|??|???/gi, 'i');
    name = name.replace(/??|??|???|??|???|??|???|???|???|???|???|??|???|???|???|???|???/gi, 'o');
    name = name.replace(/??|??|???|??|???|??|???|???|???|???|???/gi, 'u');
    name = name.replace(/??|???|???|???|???/gi, 'y');
    name = name.replace(/??/gi, 'd');

    name = name.replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi, '-');

    name = name.replace(/\-\-\-\-\-/gi, '-');
    name = name.replace(/\-\-\-\-/gi, '-');
    name = name.replace(/\-\-\-/gi, '-');
    name = name.replace(/\-\-/gi, '-');

    name = '@' + name + '@';
    var slug = name.replace(/\@\-|\-\@|\@/gi, '');
    return slug;
  }
}
