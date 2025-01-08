// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { CodeHawksCrawlerModule } from './code-hawks-crawler/code-hawks-crawler.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CodeHawksCrawlerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
