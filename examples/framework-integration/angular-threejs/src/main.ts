import { bootstrapApplication } from '@angular/platform-browser';
import '@3lens/themes/styles.css';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent)
  .catch((err) => console.error(err));

