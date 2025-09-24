import { Request, Response } from 'express';
import { HosttermsServices } from './hostterms.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import pick from '../../../shared/pick';
import { hosttermsFilterables } from './hostterms.constants';
import { paginationFields } from '../../../interfaces/pagination';

const createHostterms = catchAsync(async (req: Request, res: Response) => {
  const hosttermsData = req.body;

  const result = await HosttermsServices.createHostterms(
    req.user!,
    hosttermsData
  );

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Hostterms created successfully',
    data: result,
  });
});

const updateHostterms = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const hosttermsData = req.body;

  const result = await HosttermsServices.updateHostterms(req.user!, id, hosttermsData);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Hostterms updated successfully',
    data: result,
  });
});

const getSingleHostterms = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await HosttermsServices.getSingleHostterms(id, req.user!);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Hostterms retrieved successfully',
    data: result,
  });
});
const getHostDefaultTerms = catchAsync(async (req: Request, res: Response) => {

  const result = await HosttermsServices.getHostDefaultTerms(req.user!);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Hostterms retrieved successfully',
    data: result,
  });
});

const getAllHosttermss = catchAsync(async (req: Request, res: Response) => {
  const filterables = pick(req.query, hosttermsFilterables);
  const pagination = pick(req.query, paginationFields);

  const result = await HosttermsServices.getAllHosttermss(
    req.user!,
    filterables,
    pagination
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Hosttermss retrieved successfully',
    data: result,
  });
});

const deleteHostterms = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await HosttermsServices.deleteHostterms(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Hostterms deleted successfully',
    data: result,
  });
});

export const HosttermsController = {
  createHostterms,
  updateHostterms,
  getSingleHostterms,
  getAllHosttermss,
  deleteHostterms,
  getHostDefaultTerms
};