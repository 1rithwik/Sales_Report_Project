import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import * as XLSX from 'xlsx';
//import { Router } from 'express';
import { Route,Router } from '@angular/router';

interface PurchaseData {
  date: string;
  invoiceNo: string;
  taxableAmt28: number;
  taxableAmt18: number;
  tcs: number;
  cgst14: number;
  cgst9: number;
  sgst14: number;
  sgst9: number;
  total: number;
  partyName: string;
  gstNo: string;
}

interface salesData {
  date: string;
  invoiceNo: string;
  taxableAmt28: number;
  taxableAmt18: number;
  igst28: number;
  cgst14: number;
  cgst9: number;
  sgst14: number;
  sgst9: number;
  total: number;
  partyName: string;
  gstNo: string;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  showForm = true;
  showTable = false;
  dataForm: FormGroup;
  //tableData: InvoiceData[] = [];
  purchaseData: PurchaseData[] = [];
  salesData: salesData[] = [];
  dataType= 'purchase';  // Default to purchase

  constructor(private fb: FormBuilder, private router:Router) {
    this.dataForm = this.fb.group({
      dataType:['purchase',Validators.required],
      date: ['', Validators.required],
      invoiceNo: ['', Validators.required],
      taxableAmt28: ['', Validators.required],
      taxableAmt18:['', Validators.required],
      tcs: '',
      igst28:'',
      cgst14: [{ value: 0 }],
      cgst9: [{ value: 0 }],
      sgst14: [{ value: 0}],
      sgst9: [{ value: 0 }],
      total: [{ value: 0 }],
      partyName: '',
      gstNo: ''
    });
    
    const savedPurchaseData=localStorage.getItem('purchaseData');
    const savedSalesData=localStorage.getItem('salesData');

    if(savedPurchaseData) this.purchaseData=JSON.parse(savedPurchaseData);
    if(savedSalesData) this.salesData=JSON.parse(savedSalesData);
  }

  ngOnInit() {
    // Subscribe to changes in taxableAmt28
    this.dataForm.get('taxableAmt28')?.valueChanges.subscribe(value => {
      const cgst14 = Number((value * 0.14).toFixed(2));

      this.dataForm.patchValue({
        cgst14: cgst14,
        sgst14: cgst14
      }, { emitEvent: false });
      //this.calculateTotal();
    });

    // Subscribe to changes in taxableAmt18
    this.dataForm.get('taxableAmt18')?.valueChanges.subscribe(value => {
      const cgst9 = value * 0.09;
      this.dataForm.patchValue({
        cgst9: cgst9,
        sgst9: cgst9
      }, { emitEvent: false });
      //this.calculateTotal();
    });
  }

  calculateTotal() {
    const form = this.dataForm.getRawValue();
    let total;
    if (this.dataType === 'purchase') {
      total = form.taxableAmt28 + form.taxableAmt18 + form.tcs +
              form.cgst14 + form.cgst9 + form.sgst14 + form.sgst9;
    } else {
      total = form.taxableAmt28 + form.taxableAmt18 + form.igst28 +
              form.cgst14 + form.cgst9 + form.sgst14 + form.sgst9;
    }
    this.dataForm.patchValue({ total: total }, { emitEvent: false });
  }

  toggleForm() {
    this.showTable = false;
    this.showForm = true;
  }

  toggleTable() {
    this.showTable = true;
    this.showForm = false;
  }

  onSubmit() {
    if (this.dataForm.valid) {
      const formValue = this.dataForm.getRawValue();
      if (this.dataType === 'purchase') {
        this.purchaseData.push(formValue);
        // save to local storage
        localStorage.setItem('purchaseData', JSON.stringify(this.purchaseData));
      } else {
        this.salesData.push(formValue);
        // save to local storage
        localStorage.setItem('salesData', JSON.stringify(this.salesData));
      }
      this.dataForm.reset({ dataType: this.dataType }); // Reset but keep selected data type
    }
  }

  onDataTypeChange(event: any) {
    this.dataType = event.target.value;
  }

  exportToExcel(): void {
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    
    // Define custom headers for purchase
    const purchaseHeaders = {
      date: 'DATE',
      invoiceNo: 'INV.NO',
      taxableAmt28: 'TAXABLE AMT 28%',
      taxableAmt18: 'TAXABLE AMT 18%',
      tcs: 'TCS @0.100%',
      cgst14: 'CGST @14%',
      cgst9: 'CGST @9%',
      sgst14: 'SGST @14%',
      sgst9: 'SGST @9%',
      total: 'TOTAL',
      partyName: 'PARTY NAME',
      gstNo: 'GST NO'
    };

    // Define custom headers for sales
    const salesHeaders = {
      date: 'DATE',
      invoiceNo: 'INV.NO',
      taxableAmt28: 'TAXABLE AMT 28%',
      taxableAmt18: 'TAXABLE AMT 18%',
      igst28: 'IGST @28%',
      cgst14: 'CGST @14%',
      cgst9: 'CGST @9%',
      sgst14: 'SGST @14%',
      sgst9: 'SGST @9%',
      total: 'Total',
      partyName: 'PARTY NAME',
      gstNo: 'GST NO'
    };

    // Create Purchase sheet
    if (this.purchaseData.length > 0) {
      //const filteredPurchaseData = this.purchaseData.map(({dataType, igst28, ...rest}) => rest);
      const purchaseWS = XLSX.utils.json_to_sheet(this.purchaseData, { header: Object.keys(purchaseHeaders) });
      XLSX.utils.sheet_add_aoa(purchaseWS, [Object.values(purchaseHeaders)], { origin: 'A1' });
      XLSX.utils.book_append_sheet(wb, purchaseWS, 'Purchase');
    }

    // Create Sales sheet
    if (this.salesData.length > 0) {
      //const filteredSalesData = this.salesData.map(({datatype, tcs, ...rest}) => rest);
      const salesWS = XLSX.utils.json_to_sheet(this.salesData, { header: Object.keys(salesHeaders) });
      XLSX.utils.sheet_add_aoa(salesWS, [Object.values(salesHeaders)], { origin: 'A1' });
      XLSX.utils.book_append_sheet(wb, salesWS, 'Sales');
    }
    
    XLSX.writeFile(wb, 'invoice-data.xlsx');

    //clear local storage
    localStorage.removeItem('purchaseData');
    localStorage.removeItem('salesData');
    this.purchaseData=[];
    this.salesData=[];
  }

  logout(){
    this.router.navigate(['/login']);
  }
}
