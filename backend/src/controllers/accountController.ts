// import { NextFunction, Request, Response } from 'express';
// import catchAsync from '../utils/catchAsync';
// import { ILoginWithGoogleRequest } from '../interfaces/request/account.request';
// import Account from '../models/accountModel';
// import User from '../models/userModel';

// export const loginWithGoogle = catchAsync(
//   async (req: ILoginWithGoogleRequest, res: Response, next: NextFunction) => {
//     const existingUser = await User.findOne({ email: req.body.email });

//     // await Account.findOneAndUpdate(
//     //   {
//     //     providerAccountId: req.body.providerAccountId,
//     //   },
//     //   {
//     //     providerAccessToken: req.body.providerAccessToken,
//     //     expires: req.body.expires,
//     //   }
//     // );

//     // if (user) {
//     //   return res.status(200).json({
//     //     status: 'success',
//     //     data: {
//     //       token: req.body.providerAccessToken,
//     //       user,
//     //     },
//     //   });
//     // }

//     // await User.create({
//     //   name: req.body.name,
//     //   email: req.body.email,
//     //   photo: req.body?.photo,
//     //   accountType: req.body.accountType,
//     //   verified: req.body.verified,
//     // });

//     // const userId = await User.findOne({
//     //   email: req.body.email,
//     // });

//     // await Account.create({
//     //   type: req.body.type,
//     //   provider: req.body.provider,
//     //   providerAccountId: req.body.providerAccountId,
//     //   userId: userId,
//     //   providerAccessToken: req.body.providerAccessToken,
//     //   expires: req.body.expires,
//     // });

//     if (existingUser) {
//       // 2.1 Update Account details if necessary
//       const updatedAccount = await Account.findOneAndUpdate(
//         { providerAccountId: req.body.providerAccountId },
//         {
//           providerAccessToken: req.body.providerAccessToken,
//           expires: req.body.expires,
//         },
//         { new: true } // Return the updated document
//       );

//       // 2.2 Send success response with updated token and user data
//       return res.status(200).json({
//         status: 'success',
//         data: {
//           token: updatedAccount?.providerAccessToken, // Use updated token if available
//           user: existingUser,
//         },
//       });
//     }
//   }
// );

import { NextFunction, Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import { ILoginWithGoogleRequest } from '../interfaces/request/account.request';
import Account from '../models/accountModel';
import User from '../models/userModel';
import { AppError } from '../utils/appError';

export const loginWithGoogle = catchAsync(
  async (req: ILoginWithGoogleRequest, res: Response, next: NextFunction) => {
    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser) {
      const updatedAccount = await Account.findOneAndUpdate(
        { providerAccountId: req.body.providerAccountId },
        {
          providerAccessToken: req.body.providerAccessToken,
          expires: req.body.expires,
        },
        { new: true }
      );

      const loginWithExistingUserResponse = {
        success: true,
        message: 'Login successful',
        data: {
          token: updatedAccount?.providerAccessToken,
          user: existingUser,
        },
      };

      return res.status(200).json(loginWithExistingUserResponse);
    }

    try {
      const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        photo: req.body?.photo,
        accountType: req.body.accountType,
        verified: req.body.verified,
      });

      const newAccount = await Account.create({
        type: req.body.type,
        provider: req.body.provider,
        providerAccountId: req.body.providerAccountId,
        userId: newUser._id,
        providerAccessToken: req.body.providerAccessToken,
        expires: req.body.expires,
      });

      const loginWithNewUserResponse = {
        success: true,
        message: 'Login successful',
        data: {
          token: newAccount.providerAccessToken,
          user: newUser,
        },
      };

      return res.status(201).json(loginWithNewUserResponse);
    } catch (error) {
      console.error('Error creating user or account:', error);

      return next(
        new AppError('Error creating user or account. Please try again.', 500)
      );
    }
  }
);