import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MusicService {

  baseUrl = 'http://localhost:3001'
  isLoggedIn = new Subject<boolean>();
  constructor(private _http: HttpClient) { }

  public fetchSongs(): Observable<any> {
    return this._http.get(this.baseUrl + "/songs/");
  };
  public fetchUsers(): Observable<any> {
    return this._http.get(this.baseUrl + "/songs/users");
  };
  public fetchLiked(): Observable<any> {
    return this._http.get(this.baseUrl + "/songs/likedSongs?id=" + localStorage.getItem('user_id'));
  };  
  public fetchRecommendations(id: any): Observable<any> {
    return this._http.post(this.baseUrl + "/songs/recommendations", { id: id, user_id: localStorage.getItem('id')});
  };
  public performLogin(uname: any,pswd: any): Observable<any> {
    return this._http.post(this.baseUrl + "/songs/login", { email: uname, password: pswd });
  };
  public removeLikedSong(userId: any, songId: any): Observable<any> {
    return this._http.post(this.baseUrl + "/songs/removeLikedSong", { user_id: userId, song_id: songId });
  };
  public addLikedSong(userId: any, songId: any): Observable<any> {
    return this._http.post(this.baseUrl + "/songs/addLikedSong", { user_id: userId, song_id: songId });
  };
}
