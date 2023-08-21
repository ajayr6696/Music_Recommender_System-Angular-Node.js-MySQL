import { Component, OnInit } from '@angular/core';
import { MusicService } from '../services/music.service';
import { NgxSpinnerService } from 'ngx-spinner'
import { Router} from '@angular/router';

@Component({
  selector: 'app-music-list',
  templateUrl: './music-list.component.html',
  styleUrls: ['./music-list.component.css']
})
export class MusicListComponent implements OnInit {
  musicList: any=[];
  likedSongsList: any;
  isSongLiked: any;

  constructor(public musicService: MusicService, public spinner: NgxSpinnerService,private router: Router) { }

  ngOnInit(): void {
    if(!localStorage.getItem("user_id")){
      this.musicService.isLoggedIn.next(false);
      console.log("false");
      this.router.navigateByUrl("/login");
    }
    else{
      this.fetchSongs()
    }
  }

  fetchSongs() {
    this.spinner.show();
    this.musicService.fetchSongs().subscribe(response => {
      console.log(response)
      if (response.status_code == 200) {
        this.musicList = response.data;
        this.musicService.fetchLiked().subscribe(response => {
          console.log(response)
          if (response.status_code == 200) {
            this.likedSongsList = response.data;
            console.log("Start:",this.musicList);
            for(let i=0;i<this.musicList.length;i++)
            {
              let song_id = this.musicList[i].song_id;
              var songsLikedByUser = this.likedSongsList.filter(function (el: any) {
                return el.song_id == song_id;
              });
              if(songsLikedByUser.length)
              {
                this.musicList[i].isLiked = true;
              }
              else
              {
                this.musicList[i].isLiked = false;
              }
            }
            console.log("Final:",this.musicList);
            this.spinner.hide()
          } else {
              //this.spinner.hide()
              alert("Something went wrong");
            }
        })
        //this.spinner.hide()
      } else {
        this.spinner.hide()
        alert("Something went wrong");
      }
    })
  }
}
