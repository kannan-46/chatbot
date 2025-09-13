import { Test, TestingModule } from '@nestjs/testing';
import { GptsController } from './gpts.controller';

describe('GptsController', () => {
  let controller: GptsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GptsController],
    }).compile();

    controller = module.get<GptsController>(GptsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
