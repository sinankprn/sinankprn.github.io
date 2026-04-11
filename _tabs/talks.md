---
layout: page
icon: fas fa-microphone-alt
order: 4
description: "Conference presentations and talks by Sinan Koparan on AI, large language models, and sports analytics research."
---

<p class="page-intro">Conference presentations and invited talks on AI, large language models, and sports analytics.</p>

{% assign sorted_talks = site.data.talks | sort: 'year' | reverse %}
{% assign current_year = '' %}
{% for talk in sorted_talks %}
  {% if talk.year != current_year %}
    {% unless forloop.first %}</div>{% endunless %}
<h2 class="year-group-heading">{{ talk.year }}</h2>
<div class="year-group">
    {% assign current_year = talk.year %}
  {% endif %}
  <div class="pub-card">
    <h3>{{ talk.title }}</h3>
    <div class="pub-venue">{{ talk.venue }}</div>
    <div class="pub-links">
      {% for link in talk.links %}
      <a href="{{ link.url }}" target="_blank" rel="noopener"><i class="{{ link.icon }}" aria-hidden="true"></i> {{ link.label }}</a>
      {% endfor %}
    </div>
  </div>
  {% if forloop.last %}</div>{% endif %}
{% endfor %}
