import Author from '../models/author'; // Adjust the import to your Author model path
import { getAuthorList } from '../pages/authors'; // Adjust the import to your function

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
    it('should handle authors with missing date_of_death', async () => {
        const sortedAuthors = [
            {
                first_name: 'Stephen',
                family_name: 'King',
                date_of_birth: new Date('1947-09-21'),
                date_of_death: null
            }
        ];

        const mockFind = jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(sortedAuthors)
        });

        Author.find = mockFind;

        const result = await getAuthorList();

        const expectedAuthors = ['King, Stephen : 1947 - '];
        expect(result).toEqual(expectedAuthors);
    });

    it('should handle authors with missing date_of_birth', async () => {
        const sortedAuthors = [
            {
                first_name: 'Homer',
                family_name: '',
                date_of_birth: null,
                date_of_death: new Date('-000750-01-01')  // Approximate date for 750 BC
            }
        ];

        const mockFind = jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(sortedAuthors)
        });

        Author.find = mockFind;

        const result = await getAuthorList();

        const expectedAuthors = [' :  - -750', ':  - -751'];
        expect(result).toEqual(expectedAuthors);
    });

    it('should handle authors with both dates missing', async () => {
        const sortedAuthors = [
            {
                first_name: 'Anonymous',
                family_name: '',
                date_of_birth: null,
                date_of_death: null
            }
        ];

        const mockFind = jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(sortedAuthors)
        });

        Author.find = mockFind;

        const result = await getAuthorList();

        const expectedAuthors = [' :  - '];
        expect(result).toEqual(expectedAuthors);
    });

    it('should handle non-Date objects for birth and death dates', async () => {
        const sortedAuthors = [
            {
                first_name: 'Test',
                family_name: 'Author',
                date_of_birth: '1900',
                date_of_death: '2000'
            }
        ];

        const mockFind = jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(sortedAuthors)
        });

        Author.find = mockFind;

        const result = await getAuthorList();

        const expectedAuthors = ['Author, Test : 1899 - 1999'];
        expect(result).toEqual(expectedAuthors);
    });

    it('should handle unexpected properties in author objects', async () => {
        const sortedAuthors = [
            {
                first_name: 'Unexpected',
                family_name: 'Author',
                unexpected_property: 'value'
            }
        ];

        const mockFind = jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(sortedAuthors)
        });

        Author.find = mockFind;

        const result = await getAuthorList();

        const expectedAuthors = ['Author, Unexpected :  - '];
        expect(result).toEqual(expectedAuthors);
    });
});
