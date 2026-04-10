---
layout: page
icon: fas fa-file-alt
order: 5
description: "Peer-reviewed publications by Sinan Koparan on sports analytics, community sport, and health promotion research."
---

{% for pub in site.data.publications %}
<div class="pub-card">
  <h3>{{ pub.title }}</h3>
  <div class="pub-authors">{{ pub.authors | markdownify | remove: '<p>' | remove: '</p>' }}</div>
  <div class="pub-venue">{{ pub.venue }}</div>
  <div class="pub-links">
    {% for link in pub.links %}
    <a href="{{ link.url }}"><i class="{{ link.icon }}"></i> {{ link.label }}</a>
    {% endfor %}
  </div>
</div>
{% endfor %}
