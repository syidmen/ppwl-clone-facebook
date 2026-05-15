import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { authModule } from './modules/auth';
import { userModule } from './modules/users'; 

const app = new Elysia()
  .use(cors())
  .get('/', () => ({ 
    service: "PPWL Social Media API", 
    status: "ready" 
  }))
  
  .use(authModule) 
  .use(userModule)
  
  .listen(3000);

console.log(`🚀 Server ready at http://localhost:3000`);