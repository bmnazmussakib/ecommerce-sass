import { Test, TestingModule } from '@nestjs/testing';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';

describe('WebhookController', () => {
  let controller: WebhookController;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhookController],
      providers: [{ provide: WebhookService, useValue: mockService }],
    }).compile();

    controller = module.get<WebhookController>(WebhookController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create should call service', async () => {
    mockService.create.mockResolvedValue({ id: 'wh1' });
    await controller.create({
      url: 'https://hook.com',
      events: ['order.placed'],
    });
    expect(mockService.create).toHaveBeenCalledWith({
      url: 'https://hook.com',
      events: ['order.placed'],
    });
  });

  it('findAll should call service', async () => {
    mockService.findAll.mockResolvedValue([]);
    await controller.findAll();
    expect(mockService.findAll).toHaveBeenCalled();
  });

  it('findOne should call service', async () => {
    mockService.findOne.mockResolvedValue({ id: 'wh1' });
    await controller.findOne('wh1');
    expect(mockService.findOne).toHaveBeenCalledWith('wh1');
  });

  it('update should call service', async () => {
    mockService.update.mockResolvedValue({ id: 'wh1' });
    await controller.update('wh1', { url: 'https://new.com' });
    expect(mockService.update).toHaveBeenCalledWith('wh1', {
      url: 'https://new.com',
    });
  });

  it('remove should call service', async () => {
    mockService.remove.mockResolvedValue({ id: 'wh1' });
    await controller.remove('wh1');
    expect(mockService.remove).toHaveBeenCalledWith('wh1');
  });
});
