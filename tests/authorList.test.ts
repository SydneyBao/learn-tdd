import Author from '../models/author'; // Adjust the import to your Author model path
import { getAuthorList, showAllAuthors } from '../pages/authors'; // Adjust the import to your function
import { Response } from 'express';


describe('getAuthorList', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should fetch and format the authors list correctly', async () => {
        // Define the sorted authors list as we expect it to be returned by the database
        const sortedAuthors = [
            {
                first_name: 'Jane',
                family_name: 'Austen',
                date_of_birth: new Date('1775-12-16'),
                date_of_death: new Date('1817-07-18')
            },
            {
                first_name: 'Amitav',
                family_name: 'Ghosh',
                date_of_birth: new Date('1835-11-30'),
                date_of_death: new Date('1910-04-21')
            },
            {
                first_name: 'Rabindranath',
                family_name: 'Tagore',
                date_of_birth: new Date('1812-02-07'),
                date_of_death: new Date('1870-06-09')
            }
        ];

        // Mock the find method to chain with sort
        const mockFind = jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(sortedAuthors)
        });

        // Apply the mock directly to the Author model's `find` function
        Author.find = mockFind;

        // Act: Call the function to get the authors list
        const result = await getAuthorList();

        // Assert: Check if the result matches the expected sorted output
        const expectedAuthors = [
            'Austen, Jane : 1775 - 1817',
            'Ghosh, Amitav : 1835 - 1910',
            'Tagore, Rabindranath : 1812 - 1870'
        ];
        expect(result).toEqual(expectedAuthors);

        // Verify that `.sort()` was called with the correct parameters
        expect(mockFind().sort).toHaveBeenCalledWith([['family_name', 'ascending']]);

    });

    it('should format fullname as empty string if first name is absent', async () => {
        // Define the sorted authors list as we expect it to be returned by the database
        const sortedAuthors = [
            {
                first_name: '',
                family_name: 'Austen',
                date_of_birth: new Date('1775-12-16'),
                date_of_death: new Date('1817-07-18')
            },
            {
                first_name: 'Amitav',
                family_name: 'Ghosh',
                date_of_birth: new Date('1835-11-30'),
                date_of_death: new Date('1910-04-21')
            },
            {
                first_name: 'Rabindranath',
                family_name: 'Tagore',
                date_of_birth: new Date('1812-02-07'),
                date_of_death: new Date('1870-06-09')
            }
        ];

        // Mock the find method to chain with sort
        const mockFind = jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(sortedAuthors)
        });

        // Apply the mock directly to the Author model's `find` function
        Author.find = mockFind;

        // Act: Call the function to get the authors list
        const result = await getAuthorList();

        // Assert: Check if the result matches the expected sorted output
        const expectedAuthors = [
            ' : 1775 - 1817',
            'Ghosh, Amitav : 1835 - 1910',
            'Tagore, Rabindranath : 1812 - 1870'
        ];
        expect(result).toEqual(expectedAuthors);

        // Verify that `.sort()` was called with the correct parameters
        expect(mockFind().sort).toHaveBeenCalledWith([['family_name', 'ascending']]);

    });

    it('should return an empty array when an error occurs', async () => {
        // Arrange: Mock the Author.find() method to throw an error
        Author.find = jest.fn().mockImplementation(() => {
            throw new Error('Database error');
        });

        // Act: Call the function to get the authors list
        const result = await getAuthorList();

        // Assert: Verify the result is an empty array
        expect(result).toEqual([]);
    });
});

describe('showAllAuthors', () => {
    let res: Partial<Response>;
  
    beforeEach(() => {
      res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should send author list when authors are found', async () => {
      const mockAuthors = [{ first_name: 'John', family_name: 'Doe', date_of_birth: new Date('1980-01-01'), date_of_death: new Date('2020-01-01') }];
      jest.spyOn(Author, 'find').mockReturnValue({ sort: jest.fn().mockResolvedValue(mockAuthors) } as any);
  
      await showAllAuthors(res as Response);
  
      expect(res.send).toHaveBeenCalledWith(['Doe, John : 1979 - 2019']);
    });
  
    it('should handle empty author list gracefully', async () => {
      jest.spyOn(Author, 'find').mockReturnValue({ sort: jest.fn().mockResolvedValue([]) } as any);
  
      await showAllAuthors(res as Response);
  
      expect(res.send).toHaveBeenCalledWith('No authors found');
    });

    it('should return an empty array and log error when a database error occurs', async () => {
        const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation();
        Author.find = jest.fn().mockImplementation(() => {
            throw new Error('Database error');
        });
    
        const result = await getAuthorList();
    
        expect(result).toEqual([]);
        
        expect(consoleErrorMock).toHaveBeenCalledWith(
            'Error fetching authors:', expect.any(Error)
        );
        
        consoleErrorMock.mockRestore();
    });
  });