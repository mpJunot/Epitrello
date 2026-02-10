import { ObjectType, Field, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class TemplateSampleCard {
  @Field()
  title: string;

  @Field(() => Float)
  position: number;
}

@ObjectType()
export class TemplateListType {
  @Field()
  title: string;

  @Field(() => Int)
  position: number;

  @Field(() => [TemplateSampleCard], { nullable: true })
  sampleCards?: TemplateSampleCard[];
}
