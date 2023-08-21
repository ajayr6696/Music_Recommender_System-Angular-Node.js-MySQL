import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login-page/login-page';
import { MusicListComponent } from './music-list/music-list.component';
import { PlayerComponent } from './player/player.component';


const routes: Routes = [
  { path: 'list', component: MusicListComponent },
  { path: 'player', component: PlayerComponent },
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo:'/login', pathMatch: 'full'},
  { path: '', redirectTo: '/login', pathMatch: 'full'}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
