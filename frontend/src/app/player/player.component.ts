import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MusicService } from '../services/music.service';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnInit {
  results: any;
  titleRecommendations: any;
  releaseRecommendations: any;
  likedRecommendations: any;

  constructor(public musicService: MusicService, public spinner: NgxSpinnerService,private router: Router) { }
  song: any;
  ngOnInit(): void {
    if(!localStorage.getItem("user_id")){
      this.musicService.isLoggedIn.next(false);
      this.router.navigateByUrl("/login");
    }
    else{
      this.song = history.state.song;
      if (!this.song) {
        let localItem = localStorage.getItem('lastListen');
        if (localItem) {
          this.song = JSON.parse(localItem)
        }
      }
      localStorage.setItem("lastListen", JSON.stringify(this.song));
      this.fetchRecommendations();
    }
  };

  fetchRecommendations() {
    this.spinner.show();
    this.musicService.fetchRecommendations(this.song.id).subscribe(response => {
      console.log("Webgui",response);
      if (response.status_code = 200) {
        this.releaseRecommendations = response.data.releaseRecommendations;
        this.titleRecommendations = response.data.titleRecommendations;
        this.likedRecommendations = response.data.likedRecommendations;

        // For better UX
        // this.releaseRecommendations = response.data.releaseRecommendations.length ? response.data.releaseRecommendations : response.data.similarSongs.slice(0, 10);
        // this.titleRecommendations = response.data.titleRecommendations.length ? response.data.titleRecommendations : response.data.similarSongs.slice(10, 20);
        this.spinner.hide()
      } else {
        this.spinner.hide()
        alert("something went wrong")
      }
    })
  }

  changeSong(song: any) {
    console.log(song)
    this.song = song;
    this.fetchRecommendations()
  }
  unlikeSong() {
    this.musicService.removeLikedSong(localStorage.getItem("user_id"), this.song.song_id).subscribe(response => {
      console.log(response)
      if (response.status_code == 200) {
        this.song.isLiked = false;
        localStorage.setItem("lastListen", JSON.stringify(this.song));
        this.fetchRecommendations();
        //this.spinner.hide()
      } else {
        this.spinner.hide()
        alert("Something went wrong");
      }
    })
  }
  likeSong() {
    this.musicService.addLikedSong(localStorage.getItem("user_id"), this.song.song_id).subscribe(response => {
      console.log(response)
      if (response.status_code == 200) {
        this.song.isLiked = true;
        localStorage.setItem("lastListen", JSON.stringify(this.song));
        this.fetchRecommendations();
        //this.spinner.hide()
      } else {
        this.spinner.hide()
        alert("Something went wrong");
      }
    })
  }

}
