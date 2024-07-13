import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../utils/db';
import Book from '../../models/Book';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const { page = 1, limit = 50 } = req.query;

  if (req.method === 'GET') {
    try {
      const books = await Book.find({})
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .exec();
      const totalBooks = await Book.countDocuments({});
      res.status(200).json({ books, totalBooks });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch books' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
