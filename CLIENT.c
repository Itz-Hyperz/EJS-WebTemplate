/* This file was made by anusO1#6969 */
#include <stdio.h>
int main() {
  int selection;
  printf("ExpressJS Web Template\n");
  printf("1. Start\n2. Update\n3. Fix\nSelect a number: ");
  scanf("%i", selection);
  switch(selection) {
    case 1:
      printf("\nStarting...\n");
      system("node index.js");
    case 2: 
      printf("\nUpdating...\n");
      system("npm i");
    case 3:
      printf("npm audit fix --force\n");
      system("npm audit fix --force");
    default: 
      printf("Invalid selection. Running default.");
      system("node index.js");
  }
  return 0;
}
