
import datetime
import requests

config = {'client_id': '1234',
 'grant_type': 'password',
 'password': '',
 'username': ''}

installation = '001U000001TzJgPIAV' 
token_url = 'https://api.sungevity.com/v1/token'
hourly_url = 'https://api.sungevity.com/v1/installation/001U000001TzJgPIAV/performance?from=%s&granularity=hourly'

def get_user_details(headers):
  return requests.get('https://api.sungevity.com/v1/current-user', headers=headers).json()

def get_auth_header():
  token_request = requests.post(token_url, data=config)
  token = token_request.json()['access_token']
  headers = {'Authorization':'Bearer %s' % token}
  return headers

def get_hourly(headers, datestr=None):
  if not datestr:
    datestr = datetime.datetime.now().strftime('%Y-%m-%d')
  url = hourly_url % datestr
  return requests.get(url, headers=headers).json()

if __name__ == '__main__':
  headers = get_auth_header()
  print get_hourly(headers)
