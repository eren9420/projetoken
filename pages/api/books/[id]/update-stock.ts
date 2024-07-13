// pages/api/books/[id]/update-stock.ts
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
    try {
      if (!mongoose.Types.ObjectId.isValid(id as string)) {
        return res.status(400).json({ error: 'Invalid book ID' });
      }

      // Mevcut stok durumunu al
      const book = await Book.findById(id);
      if (!book) {
        return res.status(404).json({ error: 'Book not found' });
      }

      // Yeni stok durumunu belirle
      const newAvailability = book.availability === 'In Stock' ? 'Out of Stock' : 'In Stock';

      const updatedBook = await Book.findByIdAndUpdate(
        id,
        { availability: newAvailability },
        { new: true, runValidators: true }
      );

      res.status(200).json({ message: 'Stock updated successfully', data: updatedBook });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default handler;
