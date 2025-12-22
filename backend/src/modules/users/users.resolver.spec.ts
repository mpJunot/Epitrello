import { Test, TestingModule } from '@nestjs/testing';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

describe('UsersResolver', () => {
  let resolver: UsersResolver;
  let usersService: UsersService;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsersService = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersResolver,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    resolver = module.get<UsersResolver>(UsersResolver);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('me', () => {
    it('should return current user', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await resolver.me({ id: '1' });

      expect(result).toEqual(mockUser);
      expect(usersService.findOne).toHaveBeenCalledWith('1');
    });

    it('should return null if no user', async () => {
      const result = await resolver.me(null);

      expect(result).toBeNull();
      expect(usersService.findOne).not.toHaveBeenCalled();
    });
  });

  describe('users', () => {
    it('should return all users', async () => {
      const users = [mockUser, { ...mockUser, id: '2', email: 'test2@example.com' }];
      mockUsersService.findAll.mockResolvedValue(users);

      const result = await resolver.users();

      expect(result).toEqual(users);
      expect(usersService.findAll).toHaveBeenCalled();
    });
  });

  describe('user', () => {
    it('should return a user by id', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await resolver.user('1');

      expect(result).toEqual(mockUser);
      expect(usersService.findOne).toHaveBeenCalledWith('1');
    });

    it('should return null if user not found', async () => {
      mockUsersService.findOne.mockResolvedValue(null);

      const result = await resolver.user('999');

      expect(result).toBeNull();
      expect(usersService.findOne).toHaveBeenCalledWith('999');
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const createUserInput = {
        email: 'new@example.com',
        name: 'New User',
        password: 'password123',
      };

      mockUsersService.create.mockResolvedValue({ ...mockUser, ...createUserInput });

      const result = await resolver.createUser(createUserInput);

      expect(result.email).toBe(createUserInput.email);
      expect(usersService.create).toHaveBeenCalledWith(createUserInput);
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const updateUserInput = {
        name: 'Updated Name',
        avatar: 'https://example.com/avatar.jpg',
      };

      const updatedUser = { ...mockUser, ...updateUserInput };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await resolver.updateUser('1', updateUserInput);

      expect(result.name).toBe(updateUserInput.name);
      expect(result.avatar).toBe(updateUserInput.avatar);
      expect(usersService.update).toHaveBeenCalledWith('1', updateUserInput);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user and return true', async () => {
      mockUsersService.remove.mockResolvedValue(true);

      const result = await resolver.deleteUser('1');

      expect(result).toBe(true);
      expect(usersService.remove).toHaveBeenCalledWith('1');
    });

    it('should return false if user not found', async () => {
      mockUsersService.remove.mockResolvedValue(false);

      const result = await resolver.deleteUser('999');

      expect(result).toBe(false);
      expect(usersService.remove).toHaveBeenCalledWith('999');
    });
  });
});
