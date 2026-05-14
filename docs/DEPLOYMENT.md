# PeerForge - Deployment Guide

## Pre-Deployment Checklist

- [ ] All tests passing
- [ ] No console errors or warnings
- [ ] Environment variables set correctly
- [ ] Database backups configured
- [ ] Monitoring and alerting setup
- [ ] Error tracking configured
- [ ] Performance optimized

## Frontend Deployment (Vercel)

### Initial Setup

1. **Connect GitHub Repository**
   ```
   1. Go to vercel.com
   2. Click "New Project"
   3. Import GitHub repository
   4. Select "Next.js" as framework
   ```

2. **Configure Build Settings**
   ```
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

3. **Set Environment Variables**
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<value>
   CLERK_SECRET_KEY=<value>
   NEXT_PUBLIC_API_URL=<backend-url>
   ```

4. **Deploy**
   ```
   Click "Deploy"
   ```

### Automatic Deployments

- Push to `main` → Auto-deploys to production
- Push to `develop` → Auto-deploys to staging
- Create PR → Preview deployment created

### Domain Configuration

```
1. Go to Project Settings
2. Click Domains
3. Add custom domain
4. Update DNS records
```

## Backend Deployment (Railway/Render)

### Railway Deployment

1. **Connect GitHub**
   ```
   1. Go to railway.app
   2. Click "New Project"
   3. Connect GitHub
   4. Select repository
   ```

2. **Configure Environment**
   ```
   Set environment variables:
   - DATABASE_URL
   - NODE_ENV=production
   - FRONTEND_URL
   - CLERK_SECRET_KEY
   ```

3. **Database Setup**
   ```
   1. Add PostgreSQL plugin
   2. Configure connection
   3. Run migrations
   ```

4. **Deploy**
   ```
   Automatic on push to main
   ```

### Render Deployment

1. **Create Service**
   ```
   1. Go to render.com
   2. Click "New +"
   3. Select "Web Service"
   4. Connect GitHub
   ```

2. **Configure**
   ```
   Build Command: npm run build
   Start Command: npm run start:prod
   Environment: Node.js
   ```

3. **Set Environment Variables**

4. **Add PostgreSQL Database**
   ```
   1. Create PostgreSQL instance
   2. Set DATABASE_URL
   ```

5. **Deploy**

## Database Management

### Migrations

```bash
# Generate new migration
npm run migration:generate

# Deploy migrations to production
npm run migration:deploy

# Rollback (if needed)
npm run migration:rollback
```

### Backups

**Railway**: Automatic daily backups, 7-day retention

**Render**: Configure backup in PostgreSQL settings

**Manual Backup**:
```bash
pg_dump -h <host> -U <user> -d <db> > backup.sql
```

## Monitoring & Logging

### Error Tracking (Sentry)

```javascript
// apps/api/src/main.ts
import * as Sentry from "@sentry/nestjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

```javascript
// apps/web/app/layout.tsx
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Performance Monitoring

- Use Vercel Analytics for frontend
- Use Railway/Render metrics for backend
- Set up alerting for critical metrics

### Logging

**Backend**: Winston or Pino
```typescript
import { Logger } from '@nestjs/common';

const logger = new Logger('ContextName');
logger.log('Message');
logger.error('Error message');
```

**Frontend**: Consider LogRocket for session replay

## Health Checks

### Backend Health Endpoint

```typescript
// apps/api/src/health/health.controller.ts
@Controller('health')
export class HealthController {
  @Get()
  health() {
    return { status: 'ok' };
  }
}
```

### Database Health

```typescript
@Get('health/db')
async healthDb() {
  try {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ok' };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
}
```

## Scaling Strategy

### Phase 1: Single Region (0-1K users)
- Single Vercel deployment
- Single Render/Railway deployment
- Single PostgreSQL instance

### Phase 2: Multi-Region (1K-10K users)
- Vercel global CDN (automatic)
- Multi-region API with load balancing
- PostgreSQL read replicas
- Redis caching layer

### Phase 3: Advanced (10K+ users)
- Microservices architecture
- Database sharding
- Event streaming
- Advanced caching

## Rollback Procedure

### Frontend Rollback
```
Vercel Dashboard → Deployments → Select previous deployment → "Redeploy"
```

### Backend Rollback
```bash
# Railway/Render dashboard → Deployments → Rollback

# Or manually:
git revert <commit-hash>
git push main
```

### Database Rollback
```bash
# Restore from backup
pg_restore -h <host> -U <user> -d <db> backup.sql
```

## Security Considerations

### Environment Variables
- Never commit `.env.local`
- Use platform's secure variable management
- Rotate secrets regularly

### HTTPS
- Enforce HTTPS on all deployments
- Set HSTS headers
- Use secure cookies

### CORS
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
});
```

### Rate Limiting
```typescript
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
  ],
})
```

## Performance Optimization

### Frontend
- Enable compression
- Use CDN for static assets
- Implement code splitting
- Optimize images
- Cache aggressively

### Backend
- Database query optimization
- Caching strategy
- Load balancing
- Async processing

## Monitoring Dashboard

Set up monitoring for:
- API response times
- Database query times
- Error rates
- User engagement
- System resources

## Contact & Support

- **Vercel Support**: vercel.com/support
- **Railway Support**: railway.app/support
- **Render Support**: render.com/support
- **Sentry Support**: sentry.io/support

## Deployment Checklist

- [ ] Secrets manager configured
- [ ] Database backups automated
- [ ] Error tracking setup
- [ ] Performance monitoring enabled
- [ ] Health checks configured
- [ ] CDN configured
- [ ] SSL certificates valid
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Logging enabled
- [ ] Alerting configured
- [ ] Runbooks documented
- [ ] Team trained on deployment
- [ ] Rollback plan documented

---

**Last Updated**: May 2026

