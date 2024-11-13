import { Response } from 'express';
import Book from '../models/book';
import BookInstance from '../models/bookinstance';
import { showBookDtls } from '../pages/book_details';

describe('showBookDtls', () => {
    let res: Partial<Response>;
    const mockBook = {
        title: 'Mock Book Title',
        author: { name: 'Mock Author' }
    };
    const mockCopies = [
        { imprint: 'First Edition', status: 'Available' },
        { imprint: 'Second Edition', status: 'Checked Out' }
    ];

    beforeEach(() => {
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return book details when the book and copies exist', async () => {
        const mockFindOne = jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue(mockBook)
        });
        Book.findOne = mockFindOne;

        const mockFind = jest.fn().mockReturnValue({
            select: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue(mockCopies)
        });
        BookInstance.find = mockFind;

        await showBookDtls(res as Response, '12345');

        expect(mockFindOne).toHaveBeenCalledWith({ _id: '12345' });
        expect(mockFindOne().populate).toHaveBeenCalledWith('author');
        expect(mockFind).toHaveBeenCalledWith({ book: '12345' });
        expect(mockFind().select).toHaveBeenCalledWith('imprint status');
        expect(res.send).toHaveBeenCalledWith({
            title: mockBook.title,
            author: mockBook.author.name,
            copies: mockCopies
        });
    });

    it('should return 404 if the book is not found', async () => {
        Book.findOne = jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue(null)
        });

        await showBookDtls(res as Response, '12345');

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith('Book 12345 not found');
    });

    it('should return 404 if the book details are not found', async () => {
        const id = '12345';

        const mockFindOne = jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue(mockBook)
        });
        Book.findOne = mockFindOne;

        BookInstance.find = jest.fn().mockReturnValue({
            select: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue(null)
        });

        await showBookDtls(res as Response, id);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith(`Book details not found for book ${id}`);
    });

    it('should return 500 if there is an error fetching the book', async () => {
        Book.findOne = jest.fn().mockImplementation(() => {
            throw new Error('Database error');
        });

        await showBookDtls(res as Response, '12345');

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('Error fetching book 12345');
    });

    it('should return 500 if there is an error fetching book instances', async () => {
        const mockFindOne = jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue(mockBook)
        });
        Book.findOne = mockFindOne;

        BookInstance.find = jest.fn().mockImplementation(() => {
            throw new Error('Database error');
        });

        await showBookDtls(res as Response, '12345');

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('Error fetching book 12345');
    });

    it('should return null if id is not a string', async () => {
        const result = await showBookDtls(res as Response, 12345 as any);
        expect(result).toBeUndefined();
        expect(res.status).not.toHaveBeenCalled();
        expect(res.send).not.toHaveBeenCalled();
    });
});
