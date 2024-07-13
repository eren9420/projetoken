import mongoose, { Document, Model, Schema } from 'mongoose';

interface IBook extends Document {
  title: string;
  price: string;
  availability: string;
}

const BookSchema: Schema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: String, required: true },
  availability: { type: String, required: true },
});

const Book: Model<IBook> = mongoose.models.Book || mongoose.model<IBook>('Book', BookSchema);

export default Book;
export type { IBook as Book };
