import { Component, OnInit } from '@angular/core';
import { MusicService } from '../services/music.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login-page.html',
  styleUrls: ['./login-page.css']
})
export class LoginComponent implements OnInit {
  musicList: any;
  likedSongsList: any;
  email: any;
  password: any;

  constructor(public musicService: MusicService, public spinner: NgxSpinnerService,private router: Router ) { }

  ngOnInit(): void {
    if(localStorage.getItem("user_id")){
      this.musicService.isLoggedIn.next(true);
      this.router.navigateByUrl("/list");
    }
  }
  doLogin()
  {
    if(this.email.length && this.password.length)
    {
      this.musicService.performLogin(this.email, this.password).subscribe(response => {
        console.log("Webgui",response);
        if (response.status_code == 200) {
          console.log("loginnnnn response",response.data);
          localStorage.setItem("id",response.data.id);
          localStorage.setItem("user_id",response.data.user_id);
          localStorage.setItem("uname",response.data.name);
          this.musicService.isLoggedIn.next(true);
          this.spinner.hide();
          this.router.navigateByUrl("/list");
        }
        else if (response.status_code == 401) {
          this.spinner.hide()
          alert("Invalid credentials")
        }  
        else {
          this.spinner.hide()
          alert("something went wrong")
        }
      })
    }
  }
}
