import dns.resolver

def check_mx_records(domain):
    try:
        answers = dns.resolver.resolve(domain, 'MX')
        return bool(answers)
    except Exception as e:
        return False

domain = "xchangemarket.com"
has_mx_records = check_mx_records(domain)
print (has_mx_records)