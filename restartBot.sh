#!/bin/bash
#Restart the bot


function isUptodate {
  git pull | grep -e 'Already up-to-date.'
}
function restartBot {
  kill $(pidof node)