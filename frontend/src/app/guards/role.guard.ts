import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { UserService } from '../services/user.service';

@Injectable({
    providedIn: 'root'
})
export class RoleGuard implements CanActivate {
    constructor(private userService: UserService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
        const expectedRoles = route.data['roles'] as Array<string>;

        return this.userService.currentUser$.pipe(
            take(1),
            map(user => {
                if (user && expectedRoles.includes(user.role)) {
                    return true;
                }
                return this.router.createUrlTree(['/']);
            })
        );
    }
}
