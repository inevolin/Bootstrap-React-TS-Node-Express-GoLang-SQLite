# Algorithm: Maze solving (python)

Represent the maze using a 2D array (1 = wall):

```
maze = [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1]
]
```


Breadth-First Search (BFS) Algorithm:

Initialization: Initialize the BFS algorithm by creating an empty queue and a 2D array to mark visited cells.

```
from collections import deque

def initialize(maze):
    rows, cols = len(maze), len(maze[0])
    visited = [[False] * cols for _ in range(rows)]
    return deque(), visited

```

BFS Function: Perform BFS by starting from the initial position, enqueueing it, and exploring its neighbors. Continue this process until the goal is reached or all reachable cells are visited.

```
def bfs(maze, start, goal):
    queue, visited = initialize(maze)
    queue.append(start)
    visited[start[0]][start[1]] = True

    while queue:
        current = queue.popleft()

        if current == goal:
            return True  # Goal reached

        row, col = current

        # Explore neighbors (up, down, left, right)
        directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]
        for dr, dc in directions:
            new_row, new_col = row + dr, col + dc

            if 0 <= new_row < len(maze) and 0 <= new_col < len(maze[0]) and maze[new_row][new_col] == 0 and not visited[new_row][new_col]:
                queue.append((new_row, new_col))
                visited[new_row][new_col] = True

    return False  # Goal not reachable
```

Example Usage: Specify the start and goal positions, then use the BFS function to check if the goal is reachable.

```
start_position = (1, 1)
goal_position = (3, 3)

result = bfs(maze, start_position, goal_position)

if result:
    print("Goal is reachable!")
else:
    print("Goal is not reachable.")
```