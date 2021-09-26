import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  active = false;
  title = 'nielsen';
  ngOnInit(): void {
    this.active = true;
  }

  activeFalse() {
    this.active = false;
  }
}
