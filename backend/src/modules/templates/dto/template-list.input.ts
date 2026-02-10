import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { IsString, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class TemplateSampleCardInput {
  @Field()
  @IsString()
  title: string;

  @Field(() => Float)
  @IsNumber()
  position: number;
}

@InputType()
export class TemplateListInput {
  @Field()
  @IsString()
  title: string;

  @Field(() => Int)
  @IsNumber()
  position: number;

  @Field(() => [TemplateSampleCardInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemplateSampleCardInput)
  sampleCards?: TemplateSampleCardInput[];
}
