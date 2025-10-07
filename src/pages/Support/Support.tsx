import { Heading, Button } from '@chakra-ui/react'
import React from 'react'
import TypewriterComponent from 'typewriter-effect'

const Support = () => {
  return (
    <>
      <div style={{ width: "100vw", backgroundColor: "teal", height: "10vh", fontSize: "2rem" }}>RAYQuizA Support</div>
      <Heading size="5xl">
      <TypewriterComponent
        options={{
          strings: ['Stuck at something?', 'Hit a roadblock?', 'Need assistance?', 'Facing issues?', 'Have doubts?'],
          autoStart: true,
          loop: true,
        }}
      />
      </Heading>
      <Heading size="3xl">We're here to support!</Heading>
      <Heading size="xl">Contact us!</Heading>
      <Button>Mail</Button>
    </>
  )
}

export default Support
