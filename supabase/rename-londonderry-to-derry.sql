-- Use Derry instead of Londonderry across existing listings.
update services set county = 'Derry' where lower(trim(county)) = 'londonderry';
update services set town = 'Derry' where lower(trim(town)) in ('londonderry', 'derry/londonderry', 'londonderry/derry');
