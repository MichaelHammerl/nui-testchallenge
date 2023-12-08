import { Module } from '@nestjs/common';
import { QuestionController } from './question.controller';
import { ConfigModule } from '@nestjs/config';
import { FirebaseModule } from './infrastructure/firebase.module';
import { QuestionService } from './question.service';

@Module({
  imports: [ConfigModule.forRoot({ cache: true }), FirebaseModule],
  controllers: [QuestionController],
  providers: [QuestionService],
})
export class AppModule {}
