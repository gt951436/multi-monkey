import { NextFunction, Request, Response } from 'express';
import User from '../models/userModel';
import { AppError } from '../utils/appError';
import catchAsync from '../utils/catchAsync';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
  };
  file: {
    filename: string;
  };
}

const filterObj = (obj: { [x: string]: any }, ...allowedFields: string[]) => {
  const newObj: { [key: string]: any } = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

export const getMe = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    req.params.id = req.user.id;
    next();
  }
);

export const updateMe = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.body.password || req.body.passwordConfirm) {
      throw new AppError(
        'This route is not for password updates. Please use /updateMyPassword',
        400
      );
    }

    const filteredBody = filterObj(req.body, 'name', 'email');
    if (req.file) filteredBody.photo = req.file.filename;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: 'Success',
      data: {
        user: updatedUser,
      },
    });
  }
);

export const deleteMe = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
      status: 'Success',
      data: null,
    });
  }
);

export const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email }: { email: string } = req.body;

    const user = await User.findOne({ email });
    if (user) throw new AppError('User already exists', 400);

    const newUser = await User.create(req.body);

    res.status(200).json({
      status: 'Success',
      data: {
        user: newUser,
      },
    });
  }
);

export const getUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found!', 404);
    }

    res.status(200).json({
      status: 'Success',
      data: {
        user,
      },
    });
  }
);

export const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await User.find();

    res.status(200).json({
      status: 'Success',
      data: {
        users,
      },
    });
  }
);

export const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const updates = req.body;

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      throw new AppError('User not found!', 404);
    }

    res.status(200).json({
      status: 'Success',
      data: {
        user: updatedUser,
      },
    });
  }
);

export const deleteUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      throw new AppError('User not found!', 404);
    }

    res.status(200).json({
      status: 'Success',
      message: 'User deleted successfully',
    });
  }
);