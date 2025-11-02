#!/bin/bash

SESSION="utm"

# Start tmux server
tmux start-server

# Create session and first window: backend
tmux new-session -d -s $SESSION -n backend

# Top pane: nvim
tmux send-keys -t $SESSION:backend "cd backend" C-m
tmux send-keys -t $SESSION:backend "nvim ." C-m

# Split bottom horizontally
tmux split-window -v -t $SESSION:backend

# Bottom left: init project
tmux split-window -h -t $SESSION:backend.1
tmux send-keys -t $SESSION:backend.1 "cd backend" C-m
tmux send-keys -t $SESSION:backend.1 "source .venv/bin/activate" C-m
tmux send-keys -t $SESSION:backend.1 "python main.py" C-m

# Bottom right: mongodb
tmux send-keys -t $SESSION:backend.2 "cd backend" C-m
tmux send-keys -t $SESSION:backend.2 "docker run -p 27017:27017 --name mongo mongo:4.4-focal" C-m

# Create second window (tab): interface
tmux new-window -t $SESSION -n interface

# Top pane: nvim
tmux send-keys -t $SESSION:interface "cd interface" C-m
tmux send-keys -t $SESSION:interface "nvim ." C-m

# Bottom pane: npm run dev
tmux split-window -v -t $SESSION:interface
tmux send-keys -t $SESSION:interface.1 "cd interface" C-m
tmux send-keys -t $SESSION:interface.1 "npm run dev" C-m

# Create third window (tab): lazygit
tmux new-window -t $SESSION -n lazgit

# Main pane: lazygit
tmux send-keys -t $SESSION:lazygit "lazygit" C-m

# Attach to session
tmux attach-session -t $SESSION
