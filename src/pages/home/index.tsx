// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

import React, { useState, useEffect } from 'react'
import { API, Storage } from 'aws-amplify'

// import { useAuth } from 'src/hooks/useAuth'
import { listNotes } from '../../graphql/queries'
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from '../../graphql/mutations'

import { Button, CardActions, TextField } from '@mui/material'

const Home = () => {
  // Hooks
  // const auth = useAuth()
  const [notes, setNotes] = useState<any[]>([])
  console.log(notes)

  useEffect(() => {
    fetchNotes()
  }, [])

  async function fetchNotes() {
    const apiData: any = await API.graphql({ query: listNotes })
    const notesFromAPI = apiData.data.listNotes.items
    console.log(notesFromAPI)

    await Promise.all(
      notesFromAPI.map(async (note: any) => {
        if (note.image) {
          const url = await Storage.get(note.name)
          note.image = url
        }

        return note
      })
    )
    setNotes(notesFromAPI)
  }

  //GraphQL
  // async function createNote(event: FormEvent<HTMLFormElement>) {
  //   event.preventDefault()
  //   const form = event.target as HTMLFormElement
  //   const formData = new FormData(form)
  //   const data = {
  //     name: formData.get('name'),
  //     description: formData.get('description'),
  //     image: formData.get('image')
  //   }
  //   const fileInput = formData.get('image') as File
  //   if (fileInput) {
  //     await Storage.put(data.name as string, fileInput)
  //   } else {
  //     console.log('No image uploaded')
  //   }

  //   try {
  //     await API.graphql({
  //       query: createNoteMutation,
  //       variables: { input: data }
  //     })
  //     fetchNotes()
  //     if (form) {
  //       form.reset()
  //     }
  //   } catch (error) {
  //     console.error(error)
  //   }
  // }

  // @ts-ignore
  async function createNote(event) {
    event.preventDefault()
    const form = new FormData(event.target)
    const image = form.get('image')
    const data = {
      name: form.get('name'),
      description: form.get('description'),

      // @ts-ignore
      image: image.name
    }

    // @ts-ignore

    if (!!data.image) await Storage.put(data.name, image)
    await API.graphql({
      query: createNoteMutation,
      variables: { input: data }
    })
    fetchNotes()
    event.target.reset()
  }

  async function deleteNote({ id, name }: any) {
    const newNotes = notes.filter(note => note.id !== id)
    setNotes(newNotes)
    await Storage.remove(name)
    await API.graphql({
      query: deleteNoteMutation,
      variables: { input: { id } }
    })
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={5}>
        <Card>
          <CardHeader title='Add Notes'></CardHeader>
          <form onSubmit={createNote}>
            <CardActions className='card-action-dense'>
              <CardContent>
                <Typography sx={{ mb: 2 }}>
                  <TextField name='name' id='outlined-multiline-flexible' label='Node Name' multiline maxRows={4} />
                </Typography>
                <Typography sx={{ mb: 2 }}>
                  <TextField
                    name='description'
                    id='outlined-multiline-flexible'
                    label='Description'
                    multiline
                    maxRows={4}
                  />
                </Typography>
                <Typography sx={{ mb: 2 }}>
                  <Button variant='contained' component='label'>
                    Upload Photo
                    <input name='image' hidden accept='image/*' multiple type='file' />
                  </Button>
                </Typography>
                <Typography sx={{ mb: 2 }}>
                  <Button variant='outlined' type='submit'>
                    Submit
                  </Button>
                </Typography>
              </CardContent>
            </CardActions>
          </form>
        </Card>
      </Grid>

      {notes.map(note => (
        <Grid item xs={6} key={note.id || note.name}>
          <Card>
            {note.image && <img src={note.image} alt={'note img'} loading='lazy' />}
            <CardHeader title={note.name}></CardHeader>
            <CardContent>
              <Typography sx={{ mb: 2 }}>{note.description}</Typography>
            </CardContent>
            <Button onClick={() => deleteNote(note)}>Delete note</Button>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

export default Home
