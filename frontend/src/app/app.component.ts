import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MusicService } from './services/music.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'music-app';
  isLogin = false;
  userName = "";
  constructor(public musicService: MusicService, public spinner: NgxSpinnerService,private router: Router ) { }

  ngOnInit(): void {
    this.musicService.isLoggedIn.subscribe(res=> {
      console.log("response:",res);
      this.isLogin = res;
      if(this.isLogin)
    {
      this.userName =localStorage.getItem('uname') || '';
      console.log("aaaaaaaaaa",localStorage.getItem("uname"));
    }
    })
  }
  doLogout()
  {
    localStorage.clear();
    this.musicService.isLoggedIn.next(false);
    this.router.navigateByUrl("/login");
  }
}

