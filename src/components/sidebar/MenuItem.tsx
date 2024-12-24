import React from 'react'
import Button from '../ui/Button'
import { StarIcon } from '@radix-ui/react-icons'

type MenuItemProps = {
    name: string;

}

export default function MenuItem() {
  return (
   <Button className="w-full px-4 py-3 text-lg" variant="transparent">
                        <StarIcon />
                        Artist
                    </Button>
  )
}
