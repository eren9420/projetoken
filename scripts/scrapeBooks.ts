import dotenv from 'dotenv';
import axios from 'axios';
import cheerio from 'cheerio';
import connectDB from '../utils/db';
import Book from '../models/Book';

dotenv.config({ path: './.env.local' });

const scrapeBooks = async () => {
  await connectDB();

  const books: { title?: string; price: string; availability: string }[] = [];
  let currentPage = 1;
  let lastPage = 1;
  const baseUrl = 'https://books.toscrape.com/catalogue/category/books_1';

  const firstPageUrl = `${baseUrl}/index.html`;
  const firstPageData = await axios.get(firstPageUrl);
  const $ = cheerio.load(firstPageData.data);
  lastPage = parseInt($('.current').text().trim().split('of ')[1], 10);

  while (currentPage <= lastPage) {
    const url = `${baseUrl}/page-${currentPage}.html`;
    console.log(`Fetching data from ${url}`);
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    $('.product_pod').each((index, element) => {
      const title = $(element).find('h3 a').attr('title');
      const price = $(element).find('.price_color').text();
      const availability = $(element).find('.availability').text().trim();

      books.push({ title, price, availability });
    });

    currentPage++;
  }

  await Book.insertMany(books);
  console.log('Books scraped and saved successfully');
};

scrapeBooks().catch(console.error);
