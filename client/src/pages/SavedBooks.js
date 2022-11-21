import React, { useState } from 'react';
import { Jumbotron, Container, CardColumns, Card, Button } from 'react-bootstrap';

import { removeBookId } from '../utils/localStorage';
import { useQuery, useMutation } from '@apollo/client';
import { QUERY_ME } from '../utils/queries'
import { REMOVE_BOOK } from '../utils/mutations'

const SavedBooks = () => {
  const [likedBooks, setLikedBooks] = useState([]);
  const { loading,error,data } = useQuery(QUERY_ME, 
    {onCompleted: (data) =>
      {
        setLikedBooks(data.me.savedBooks)
      }
    })
  const [deleteBook, {deleteError, deleteLoading}] = useMutation(REMOVE_BOOK)


  if(loading) {
    return(<h2>Loading...</h2>)
  }
  
  const userData = likedBooks


  // create function that accepts the book's mongo _id value as param and deletes the book from the database
  const handleDeleteBook = async (bookId) => {
    try {
      const response = await deleteBook({
        variables: {bookId: bookId}
      });
      console.log(response)
      const updatedBooks = likedBooks.filter(object => object.bookId !== bookId)
      setLikedBooks(updatedBooks)
      removeBookId(bookId)
    } catch (err) {
      console.error('here',JSON.stringify(err,null,2));
    }
  };

  // if data isn't here yet, say so

  const bookCard = (book) => {
    return(
      <Card key={book.bookId} border='dark'>
        {book.image ? <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' /> : null}
        <Card.Body>
          <Card.Title>{book.title}</Card.Title>
          <p className='small'>Authors: {book.authors}</p>
          <Card.Text>{book.description}</Card.Text>
          <Button className='btn-block btn-danger' onClick={() => {handleDeleteBook(book.bookId)}}>
            Delete this Book!
          </Button>
        </Card.Body>
      </Card>
    )
  }

  const list = (likedBooks) => {
    return(
      likedBooks.map(book => bookCard(book))
      )
  }
  
  return (
    <>
      <Jumbotron fluid className='text-light bg-dark'>
        <Container>
          <h1>Viewing saved books!</h1>
          <h1>I can't figure out how to get this part to remove the whole card on delete and refreshing the page on heroku throws an error. If you navigate back to the search books, refresh, and then come back to here you will see any deletes you make.</h1>
        </Container>
      </Jumbotron>
 
        {loading ? 
         (<h2>Loading...</h2>) : 
         (
          <Container>
            <h2>
            {userData.length
              ? `Viewing ${userData.length} saved ${userData.length === 1 ? 'book' : 'books'}:`
              : 'You have no saved books!'}
            </h2>
                  <CardColumns>
                      {list(userData)}      
                </CardColumns>
              </Container>
         )}
    </>
  );
};

export default SavedBooks;
