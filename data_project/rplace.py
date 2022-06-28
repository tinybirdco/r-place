from tb.datasource import Datasource
from random import randint
import datetime
import time

token = ''

while True:
    with Datasource('pixels_table', token) as ds:
        for i in range(0, 100):
            print(str(i))
            x = randint(0, 999)
            y = randint(0, 999)
            date = datetime.datetime.now().isoformat()
            random_number = randint(0,16777215)
            hex_number = str(hex(random_number))
            color ='#'+ hex_number[2:]
            # color = '#ffffff'
            ds << {"x": x, "y": y, "timestamp": date, "color": color}
    
    time.sleep(0.5)

    

