from http.server import HTTPServer, SimpleHTTPRequestHandler
import webbrowser
import os

def run_server(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, SimpleHTTPRequestHandler)
    print(f"Server running at http://localhost:{port}")
    # Open the default browser
    webbrowser.open(f'http://localhost:{port}/index.html')
    # Start the server
    httpd.serve_forever()

if __name__ == '__main__':
    run_server() 