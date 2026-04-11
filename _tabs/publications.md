---
layout: page
icon: fas fa-file-alt
order: 3
description: "Peer-reviewed publications by Sinan Koparan on sports analytics, community sport, and health promotion research."
---

<p class="page-intro">Peer-reviewed research on sports analytics, community sport, and health promotion.</p>

{% assign sorted_pubs = site.data.publications | sort: 'year' | reverse %}
{% assign current_year = '' %}
{% for pub in sorted_pubs %}
  {% if pub.year != current_year %}
    {% unless forloop.first %}</div>{% endunless %}
<h2 class="year-group-heading">{{ pub.year }}</h2>
<div class="year-group">
    {% assign current_year = pub.year %}
  {% endif %}
  <div class="pub-card">
    <h3>
      {% if pub.type == 'book' %}<i class="fas fa-book" aria-hidden="true"></i>{% else %}<i class="fas fa-file-alt" aria-hidden="true"></i>{% endif %}
      {{ pub.title }}
    </h3>
    <div class="pub-authors">{{ pub.authors | markdownify | remove: '<p>' | remove: '</p>' }}</div>
    <div class="pub-venue">{{ pub.venue }}</div>
    <div class="pub-links">
      {% for link in pub.links %}
      <a href="{{ link.url }}" target="_blank" rel="noopener"><i class="{{ link.icon }}" aria-hidden="true"></i> {{ link.label }}</a>
      {% endfor %}
    </div>
  </div>
  {% if forloop.last %}</div>{% endif %}
{% endfor %}
