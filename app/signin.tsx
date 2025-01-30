import { SafeAreaView, Text } from 'react-native'
import React from 'react'
import { useAuth } from '@/context/AuthContext'
import { Redirect } from 'expo-router'

const signin = () => {
    const {session} = useAuth()

    if(session) return <Redirect href="/"/>
  return (
    <SafeAreaView>
      <Text>signin</Text>
    </SafeAreaView>
  )
}

export default signin