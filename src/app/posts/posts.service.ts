import { Post} from './post.model';
import { Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router} from '@angular/router';
import { environment} from '../../environments/environment';

const BACKEND_URL = environment.apiUrl + '/posts';

@Injectable({providedIn: 'root'})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{posts: Post[], postCount: number}>();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    this.http.get<{message: string, posts: any, maxPosts: number}>(BACKEND_URL + queryParams )
      .pipe(map((postData) => {
        return {posts: postData.posts.map( post => {
          return {
            title: post.title,
            content: post.content,
            likeCount: post.likeCount,
            id: post._id,
            imagePath: post.imagePath,
            creator: post.creator
          };
        }), maxPosts: postData.maxPosts};
      }))
      .subscribe( transformedPostData => {
        this.posts = transformedPostData.posts;
        this.postsUpdated.next({posts: [...this.posts], postCount: transformedPostData.maxPosts});
      });
  }

  getPostUpdatedListener() {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string) {
    return this.http.get<{_id: string, title: string, content: string, likeCount: number, imagePath: string, creator: string}>
    (BACKEND_URL + '/' + id);

  }
  addPost(title: string, content: string, image: string) {
    const postData = {};
    postData['title'] = title;
    postData['content'] = content;
    postData['image'] = image;

    this.http.post<{message: string, post: Post}>(BACKEND_URL, postData)
      .subscribe((resData) => {
        this.router.navigate(['/']);
      });
  }

  updatePost(id: string, title: string, content: string, likeCount: number, image: File | string) {
    let postData: Post | FormData;
    if (typeof(image) === 'object') {
        postData = new FormData();
        postData.append('id', id);
        postData.append('title', title);
        postData.append( 'content', content);
        postData.append('image', image, title);
    } else {
      postData = {
        id: id,
        title: title,
        content: content,
        likeCount: likeCount,
        imagePath: image,
        creator: null
      };

    }
    this.http.put(BACKEND_URL + '/' + id, postData)
      .subscribe(response => {
        this.router.navigate(['/']);
      });
  }

  likePost(postId: string, likeCount: number) {
    const postData = {id: postId, likeCount: likeCount};
    return this.http.put(BACKEND_URL + '/like/' + postId, postData);
  }

  unlikePost(postId: string, likeCount: number) {
    const postData = {id: postId, likeCount: likeCount};
    return this.http.put(BACKEND_URL + '/unlike/' + postId, postData);
  }

  deletePost(postId: string) {
   return this.http.delete(BACKEND_URL + '/' + postId);
  }
}
