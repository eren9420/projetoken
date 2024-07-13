import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import dbConnect from '../../../../utils/db';
import Book from '../../../../models/Book';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    query: { id },
    method,
  } = req;

  await dbConnect();

  if (method === 'POST') {
    const { price } = req.body;
    try {
      if (!mongoose.Types.ObjectId.isValid(id as string)) {
        return res.status(400).json({ error: 'Invalid book ID' });
      }

      const updatedBook = await Book.findByIdAndUpdate(
        id,
        { price },
        { new: true, runValidators: true }
      );

      if (!updatedBook) {
        return res.status(404).json({ error: 'Book not found' });
      }

      res.status(200).json({ message: 'Price updated successfully', data: updatedBook });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default handler;
