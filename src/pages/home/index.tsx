// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

import React, { useState, useEffect } from 'react'
import { API } from 'aws-amplify'

import { useAuth } from 'src/hooks/useAuth'
import { listNotes } from '../../graphql/queries'
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from '../../graphql/mutations'

import { Button, Flex, Heading, Text, TextField, View, withAuthenticator } from '@aws-amplify/ui-react'

const Home = () => {
  // Hooks
  // const auth = useAuth()
  const [notes, setNotes] = useState([])

  useEffect(() => {
    fetchNotes()
  }, [])

  async function fetchNotes() {
    const apiData: any = await API.graphql({ query: listNotes })
    const notesFromAPI = apiData.data.listNotes.items
    console.log(notesFromAPI)
    setNotes(notesFromAPI)
  }

  async function createNote(event: Event) {
    event.preventDefault()
    const form = event.target as HTMLFormElement
    const formData = new FormData(form)
    const data = {
      name: formData.get('name'),
      description: formData.get('description')
    }
    try {
      await API.graphql({
        query: createNoteMutation,
        variables: { input: data }
      })
      fetchNotes()
      if (form) {
        form.reset()
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Grid container spacing={6}>
      <View className='App'>
        <Heading level={1}>My Notes App</Heading>
        <View as='form' margin='3rem 0' onSubmit={createNote}>
          <Flex direction='row' justifyContent='center'>
            <TextField name='name' placeholder='Note Name' label='Note Name' labelHidden variation='quiet' required />
            <TextField
              name='description'
              placeholder='Note Description'
              label='Note Description'
              labelHidden
              variation='quiet'
              required
            />
            <Button type='submit' variation='primary'>
              Create Note
            </Button>
          </Flex>
        </View>
        <Heading level={2}>Current Notes</Heading>
      </View>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Kick start your project 🚀'></CardHeader>
          <CardContent>
            <Typography sx={{ mb: 2 }}>All the best for your new project.</Typography>
            <Typography>
              Please make sure to read our Template Documentation to understand where to go from here and how to use our
              template.
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='ACL and JWT 🔒'></CardHeader>
          <CardContent>
            <Typography sx={{ mb: 2 }}>
              Access Control (ACL) and Authentication (JWT) are the two main security features of our template and are
              implemented in the starter-kit as well.
            </Typography>
            <Typography>Please read our Authentication and ACL Documentations to get more out of them.</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default Home
