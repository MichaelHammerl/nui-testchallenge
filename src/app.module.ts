import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { FirebaseModule } from './infrastructure/firebase.module';
import { QuestionService } from './question.service';

@Module({
  imports: [ConfigModule.forRoot({ cache: true }), FirebaseModule],
  controllers: [AppController],
  providers: [QuestionService],
})
export class AppModule {}
