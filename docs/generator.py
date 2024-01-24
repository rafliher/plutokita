import numpy as np
import csv

# Set the desired total sum
target_sum = 334

# Set the matrix dimensions
rows, cols = 10, 7

# Initialize the matrix with all values set to 5
matrix = np.full((rows, cols), 5)

# Adjust some values to meet the target sum while keeping values between 1 and 5
while matrix.sum() != target_sum:
    # Get the current sum
    current_sum = matrix.sum()

    # Get the difference between the target sum and the current sum
    diff = target_sum - current_sum

    # Randomly choose a position in the matrix
    row_idx, col_idx = np.random.randint(0, rows), np.random.randint(0, cols)

    # Randomly add or subtract from the chosen position to adjust the sum
    # adjustment = np.random.choice([-1, 1])
    adjustment = -1

    # Ensure that the resulting value remains between 1 and 5
    new_value = matrix[row_idx, col_idx] + adjustment
    if 1 <= new_value <= 5:
        matrix[row_idx, col_idx] = new_value

# Print the matrix
print(matrix)

# Save the matrix to a CSV file
csv_filename = "matrix.csv"
with open(csv_filename, mode='w', newline='') as file:
    writer = csv.writer(file)
    writer.writerows(matrix)
print(f"\nMatrix saved to {csv_filename}")
