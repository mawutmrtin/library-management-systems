import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import { PrismaClient } from "../../generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const genres = [
  { name: 'Fiction', slug: 'fiction' },
  { name: 'Science Fiction', slug: 'science-fiction' },
  { name: 'Fantasy', slug: 'fantasy' },
  { name: 'Technology', slug: 'technology' },
];

const books = [
  // Fiction
  { title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '9780061120084', genreSlug: 'fiction', totalCopies: 3 },
  { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '9780743273565', genreSlug: 'fiction', totalCopies: 2 },
  { title: 'Pride and Prejudice', author: 'Jane Austen', isbn: '9780141439518', genreSlug: 'fiction', totalCopies: 2 },
  { title: 'Beloved', author: 'Toni Morrison', isbn: '9781400033416', genreSlug: 'fiction', totalCopies: 1 },
  // Science Fiction
  { title: 'Dune', author: 'Frank Herbert', isbn: '9780441013593', genreSlug: 'science-fiction', totalCopies: 3 },
  { title: 'Nineteen Eighty-Four', author: 'George Orwell', isbn: '9780451524935', genreSlug: 'science-fiction', totalCopies: 2 },
  { title: 'Neuromancer', author: 'William Gibson', isbn: '9780441569595', genreSlug: 'science-fiction', totalCopies: 2 },
  { title: 'The Left Hand of Darkness', author: 'Ursula K. Le Guin', isbn: '9780441478125', genreSlug: 'science-fiction', totalCopies: 1 },
  // Fantasy
  { title: 'The Hobbit', author: 'J.R.R. Tolkien', isbn: '9780547928227', genreSlug: 'fantasy', totalCopies: 4 },
  { title: 'A Wizard of Earthsea', author: 'Ursula K. Le Guin', isbn: '9780547773742', genreSlug: 'fantasy', totalCopies: 2 },
  { title: 'The Name of the Wind', author: 'Patrick Rothfuss', isbn: '9780756404741', genreSlug: 'fantasy', totalCopies: 2 },
  { title: 'American Gods', author: 'Neil Gaiman', isbn: '9780062572233', genreSlug: 'fantasy', totalCopies: 1 },
  // Technology
  { title: 'Clean Code', author: 'Robert C. Martin', isbn: '9780132350884', genreSlug: 'technology', totalCopies: 3 },
  { title: 'The Pragmatic Programmer', author: 'Andrew Hunt & David Thomas', isbn: '9780135957059', genreSlug: 'technology', totalCopies: 2 },
  { title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', isbn: '9781449373320', genreSlug: 'technology', totalCopies: 2 },
  { title: 'Refactoring', author: 'Martin Fowler', isbn: '9780134757599', genreSlug: 'technology', totalCopies: 1 },
];

async function main() {
  const genreIds: Record<string, number> = {};
  for (const g of genres) {
    const genre = await prisma.genre.upsert({
      where: { slug: g.slug },
      update: {},
      create: g,
    });
    genreIds[g.slug] = genre.id;
  }

  for (const { genreSlug, totalCopies, ...rest } of books) {
    await prisma.book.upsert({
      where: { isbn: rest.isbn },
      update: {},
      create: {
        ...rest,
        totalCopies,
        availableCopies: totalCopies,
        genreId: genreIds[genreSlug],
      },
    });
  }

  // Passwords are hashed; these are demo accounts only
  const passwordHash = await bcrypt.hash('ChangeMe123', 10);
  await prisma.user.upsert({
    where: { email: 'librarian@example.com' },
    update: {},
    create: { email: 'librarian@example.com', name: 'Lena Librarian', password: passwordHash, role: Role.LIBRARIAN },
  });
  await prisma.user.upsert({
    where: { email: 'patron@example.com' },
    update: {},
    create: { email: 'patron@example.com', name: 'Paul Patron', password: passwordHash, role: Role.PATRON },
  });

  console.log(`Seeded ${genres.length} genres, ${books.length} books, 2 users.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());